from prefect import flow, task
from .parser import AO3Parser

@task
def parse_ao3_task(url: str):
    parser = AO3Parser()
    return parser.parse(url)

@flow
def ao3_flow(url: str):
    return parse_ao3_task(url)
