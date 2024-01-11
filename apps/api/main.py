from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from glyth.routes import auth, codes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def probe():
    pass


app.include_router(codes.router)
app.include_router(auth.router)
