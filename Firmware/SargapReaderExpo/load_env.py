Import("env")
import os

env_file = ".env"
if os.path.isfile(env_file):
    with open(env_file, "r") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            
            # Si es un número lo pasa directo, si es texto le agrega comillas escapadas para C
            if val.isdigit():
                env.Append(CPPDEFINES=[(key, val)])
            else:
                env.Append(CPPDEFINES=[(key, f'\\"{val}\\"')])
