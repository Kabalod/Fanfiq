from prefect import flow, task
from .parser import FicbookParser

@task
def parse_ficbook_task(url: str):
    parser = FicbookParser()
    return parser.parse(url)

@flow
def ficbook_flow(url: str):
    return parse_ficbook_task(url)
