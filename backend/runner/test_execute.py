import unittest

try:
    from .execute import _normalize, judge_code, run_python_code
except ImportError:
    from execute import _normalize, judge_code, run_python_code


class ExecuteTests(unittest.TestCase):
    def test_normalize_multiline_values(self):
        self.assertEqual(_normalize(r"4\n33 44 11 22"), "4\n33 44 11 22")
        self.assertEqual(_normalize("4\r\n33 44 11 22"), "4\n33 44 11 22")

    def test_run_python_code_accepts_database_escaped_input(self):
        code = """
n = int(input())
values = input().split()
print(n)
print(*values)
"""
        result = run_python_code(code, r"4\n33 44 11 22")

        self.assertEqual(result["status"], "Success")
        self.assertEqual(result["output"], "4\n33 44 11 22")

    def test_run_python_code_accepts_actual_multiline_input(self):
        code = "first = input()\nsecond = input()\nprint(first)\nprint(second)"
        result = run_python_code(code, "4\n33 44 11 22")

        self.assertEqual(result["status"], "Success")
        self.assertEqual(result["output"], "4\n33 44 11 22")

    def test_judge_code_normalizes_multiline_expected_output(self):
        code = "print('4')\nprint('33 44 11 22')"

        self.assertEqual(
            judge_code(code, "", r"4\n33 44 11 22"),
            "Accepted",
        )

    def test_run_python_code_rejects_non_string_input(self):
        result = run_python_code("print('ok')", 123)

        self.assertEqual(result["status"], "error")


if __name__ == "__main__":
    unittest.main()
