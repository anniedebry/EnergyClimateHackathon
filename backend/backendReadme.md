Create python environment. 3.10 and 3.11 work In the terminal run pip install pandas plotly matplotlib

cd into backend folder using terminal then run the following

uvicorn main:app --reload --port 8000

When to use each type of api get/post GET = asks the server for data POST = sends data to the server so it can process it, create something, or trigger an action