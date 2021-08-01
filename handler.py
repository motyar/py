from fastapi import FastAPI
from mangum import Mangum

app = FastAPI(title="MyAwesomeApp")

@app.get("/")
def hello_world():
    return {"message": "Hello World"}

handler = Mangum(app)
