import subprocess
import os
import tempfile

def run_python_code(code, test_input):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix = ".py", mode = "w") as temp:
            temp.write(code)
            filename = temp.name

        result = subprocess.run(['python', filename], input = test_input, text = True, capture_output = True, timeout = 2)
        output = result.stdout.strip()

        if result.returncode != 0:
            return {
                "status": "Runtime Error",
                "output": result.stderr
            }
        
        return {
            "status": "Success",
            "output": result.stdout.strip()
        }
    
    except subprocess.TimeoutExpired:
        return {
            "status": "TLE",
            "output": ""
        }
    
    except Exception as e:
        return {
            "status": "error",
            "output": str(e)
        }
    
    finally:
        if os.path.exists(filename):
            os.remove(filename)

def judge_code(code, test_input, expected_output):

    result = run_python_code(code, test_input)

    if result["status"] != "Success":
        return result["status"]

    if result["output"].strip() == expected_output.strip():
        return "Accepted"

    else:
        return "Wrong Answer"