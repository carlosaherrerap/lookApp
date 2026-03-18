import pyodbc
import json
import time
import random
import os
import sys
import argparse

# Configuración de conexión
DB_CONFIG = {
'server': '192.168.1.41,1433',
'database': 'SUNAT',
'user': 'sa',
'password': r'Informa2025$$', # Usamos r'' para evitar problemas con caracteres especiales
'table': 'Sunat.PadronReducido',
'columns': 'padron_id, RUC, NOMBRE_O_RAZON_SOCIAL, ESTADO_DEL_CONTRIBUYENTE, CONDICION_DE_DOMICILIO, UBIGEO, TIPO_DE_VIA, NOMBRE_VIA, CODIGO_DE_ZONA, TIPO_DE_ZONA, NUMERO, INTERIOR, LOTE, DEPARTAMENTO, MANZANA, KILOMETRO, FECHA_PERIODO',
'id_column': 'padron_id',
'batch_min': 50,
'batch_max': 200,
'sleep_min': 3,
'sleep_max': 7
}
CHECKPOINT_FILE = 'checkpoint_sunat.json'
OUTPUT_FILE = 'output_sunat.txt'



def get_connection():
    conn_str = (
        f"DRIVER={{SQL Server}};"
        f"SERVER={DB_CONFIG['server']};"
        f"DATABASE={DB_CONFIG['database']};"
        f"UID={DB_CONFIG['user']};"
        f"PWD={DB_CONFIG['password']};"
        f"APP=Workstation_Essential_Service"
    )
    return pyodbc.connect(conn_str, timeout=10)


def test_connectivity():
    print("[*] Fase de Diagnóstico:")
    try:
        conn = get_connection()
        print("[+] Conexión establecida con éxito.")
        cursor = conn.cursor()
        cursor.execute("SELECT DB_NAME()")
        db_name = cursor.fetchone()[0]
        print(f"[+] Base de datos activa: {db_name}")

        cols_list = [c.strip() for c in DB_CONFIG['columns'].split(',')]
        escaped_cols = ", ".join([f"[{c}]" for c in cols_list])
        id_col = f"[{DB_CONFIG['id_column']}]"

        print(f"[*] Verificando acceso a la tabla {DB_CONFIG['table']}...")
        try:
            cursor.execute(f"SELECT TOP 1 {escaped_cols} FROM {DB_CONFIG['table']}")
            print("[+] Acceso a campos verificado correctamente.")
        except pyodbc.Error as e:
            print(f"[!] Error de acceso a columnas: {e}")
            table_parts = DB_CONFIG['table'].split('.')
            table_name = table_parts[-1]
            schema_name = table_parts[-2] if len(table_parts) > 1 else 'dbo'
            cursor.execute(f"""
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '{table_name}'
                AND TABLE_SCHEMA = '{schema_name}'
            """)
            actual_columns = [row[0] for row in cursor.fetchall()]
            if actual_columns:
                print(f"[?] Las columnas reales en '{DB_CONFIG['table']}' son:")
                print(", ".join(actual_columns))
                print("\n[!] Por favor, actualiza la variable 'columns' en DB_CONFIG con los nombres exactos de arriba.")
            else:
                print(f"[!] No se encontró la tabla '{DB_CONFIG['table']}'. Verifica el nombre.")
            conn.close()
            return False, None, None

        conn.close()
        return True, escaped_cols, id_col
    except Exception as e:
        print(f"[!] Error crítico durante el diagnóstico: {e}")
        return False, None, None


def load_checkpoint():
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, 'r') as f:
                data = json.load(f)
                return data.get('offset', data.get('count', 0))
        except Exception:
            return 0
    return 0


def save_checkpoint(processed_count):
    with open(CHECKPOINT_FILE, 'w') as f:
        json.dump({'offset': processed_count, 'count': processed_count}, f)


def get_output_filename(total_offset):
    file_number = (total_offset // 500000) + 1
    base_name = OUTPUT_FILE.rsplit('.', 1)[0]
    return f"{base_name}_{file_number}.txt"


def extract_data(start_id=None):
    success, escaped_cols, id_col = test_connectivity()
    if not success:
        print("[!] Abortando debido a fallos en el diagnóstico.")
        return

    processed_count = load_checkpoint()
    if start_id is not None:
        print(f"[*] Inicio forzado por CLI: offset={start_id}. Se ignora checkpoint existente.")
        try:
            processed_count = int(start_id)
        except ValueError:
            print("[!] El argumento start-id debe ser numérico. Utilizando offset 0.")
            processed_count = 0
    else:
        print(f"[*] Iniciando extracción desde el registro número (offset): {processed_count}")

    try:
        conn = get_connection()
        cursor = conn.cursor()
        try:
            cursor.timeout = 120
        except Exception:
            pass

        # preparar columnas
        cols_list = [c.strip() for c in DB_CONFIG['columns'].split(',') if c.strip()]
        id_plain = DB_CONFIG['id_column']
        if id_plain in cols_list:
            cols_list.remove(id_plain)
        cols_ordered = [id_plain] + cols_list
        escaped_select = ", ".join([f"[{c}]" for c in cols_ordered])

        retry_attempts = 3

        while True:
            batch_size = random.randint(DB_CONFIG['batch_min'], DB_CONFIG['batch_max'])
            active_output = get_output_filename(processed_count)

            # Usamos paginación por OFFSET para evitar saltar datos si la columna no es única
            query = f"""
                SELECT {escaped_select}
                FROM {DB_CONFIG['table']}
                ORDER BY {id_col} ASC
                OFFSET {processed_count} ROWS
                FETCH NEXT {batch_size} ROWS ONLY
            """
            
            attempt = 0
            while attempt < retry_attempts:
                try:
                    cursor.execute(query)
                    rows = cursor.fetchall()
                    break
                except pyodbc.Error as e:
                    attempt += 1
                    wait = 2 ** attempt
                    print(f"[!] Error en consulta (intento {attempt}/{retry_attempts}): {e}")
                    if attempt >= retry_attempts:
                        raise
                    print(f"[*] Reintentando en {wait}s...")
                    time.sleep(wait)

            if not rows:
                print(f"[+] Extracción completada. No hay más registros después del offset {processed_count}.")
                break

            with open(active_output, 'a', encoding='utf-8') as f:
                for row in rows:
                    f.write(str(list(row)) + '\n')

            processed_count += len(rows)
            save_checkpoint(processed_count)

            print(f"[>] Lote extraído de {len(rows)} -> {active_output}. Total extraído hasta ahora: {processed_count}")

            time.sleep(random.uniform(DB_CONFIG['sleep_min'], DB_CONFIG['sleep_max']))

    except pyodbc.Error as e:
        print(f"[!] Error de base de datos durante extracción: {e}")
        print("[*] TIP: Si el error es de timeout, el OFFSET es demasiado grande para la capacidad del servidor.")
    except KeyboardInterrupt:
        print("\n[!] Proceso interrumpido por el usuario. Progreso guardado.")
    finally:
        if 'conn' in locals():
            conn.close()


def upload_and_cleanup():
    if os.path.exists(OUTPUT_FILE):
        print("[*] Preparando subida a la nube...")
        time.sleep(2)
        print("[+] Subida finalizada (simulación).")
    else:
        print("[!] No hay archivo de salida para procesar.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extractor por lotes con keyset pagination')
    parser.add_argument('--upload', action='store_true', help='Subir y limpiar archivo de salida')
    parser.add_argument('--reset', action='store_true', help='Eliminar checkpoint y comenzar desde cero')
    parser.add_argument('--start-id', type=str, help='Forzar inicio desde este id (ignora checkpoint)')
    args = parser.parse_args()

    if args.reset:
        if os.path.exists(CHECKPOINT_FILE):
            try:
                os.remove(CHECKPOINT_FILE)
                print(f"[!] Checkpoint {CHECKPOINT_FILE} eliminado.")
            except Exception as e:
                print(f"[!] No se pudo eliminar {CHECKPOINT_FILE}: {e}")
        else:
            print(f"[*] No existe {CHECKPOINT_FILE}; nada que resetear.")

    if args.upload:
        upload_and_cleanup()
    else:
        extract_data(start_id=args.start_id)
