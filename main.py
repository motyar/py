from fastapi import FastAPI

app = FastAPI(title="MyAwesomeApp")

@app.get("/hello")
def hello_world():
    return {"message": "Hello World"}
