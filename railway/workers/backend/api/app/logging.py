import structlog
from fastapi import Request

log = structlog.get_logger()

async def log_requests(request: Request, call_next):
    log.info("request received", path=request.url.path, method=request.method)
    response = await call_next(request)
    log.info("request finished", path=request.url.path, method=request.method, status_code=response.status_code)
    return response
