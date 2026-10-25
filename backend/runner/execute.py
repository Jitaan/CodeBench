import os
import subprocess
import sys
import tempfile


def _normalize(text):
    """Normalize database-encoded newlines and line endings."""
    if text is None:
        return None
    if not isinstance(text, str):
        raise TypeError("testcase values must be strings")
    return text.replace("\\n", "\n").replace("\r\n", "\n").replace("\r", "\n")


def run_python_code(code, test_input):
    filename = None
    try:
        if not isinstance(code, str):
            raise TypeError("code must be a string")

        if test_input is not None:
            test_input = _normalize(test_input)
            if test_input and not test_input.endswith("\n"):
                test_input += "\n"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".py",
            mode="w",
            encoding="utf-8",
        ) as temp:
            temp.write(code)
            filename = temp.name

        result = subprocess.run(
            [sys.executable, filename],
            input=test_input,
            text=True,
            capture_output=True,
            timeout=2,
            encoding="utf-8",
        )

        if result.returncode != 0:
            return {
                "status": "Runtime Error",
                "output": result.stderr,
            }

        return {
            "status": "Success",
            "output": result.stdout.strip(),
        }

    except subprocess.TimeoutExpired:
        return {
            "status": "TLE",
            "output": "",
        }

    except Exception as e:
        return {
            "status": "error",
            "output": str(e),
        }

    finally:
        if filename is not None and os.path.exists(filename):
            os.remove(filename)


def judge_code(code, test_input, expected_output):
    result = run_python_code(code, test_input)

    if result["status"] != "Success":
        return result["status"]

    actual = _normalize(result["output"]).strip()
    expected = _normalize(expected_output).strip()

    return "Accepted" if actual == expected else "Wrong Answer"
