from fastapi import FastAPI

app = FastAPI(title="MyAwesomeApp")

@app.get("/")
def handler():
    return {"message": "Hello World"}
