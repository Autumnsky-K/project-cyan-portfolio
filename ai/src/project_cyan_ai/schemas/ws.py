from pydantic import BaseModel, Field

class ClientTextInput(BaseModel):
    type: str = Field(default="text-input")
    text: str

class ServerMessage(BaseModel):
    type: str
    text: str
    actions: list[dict] = Field(default_factory=list)

class ErrorMessage(BaseModel):
    type: str = "error"
    message: str