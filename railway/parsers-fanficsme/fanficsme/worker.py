from prefect import flow, task
from .parser import FanficsmeParser

@task
def parse_fanficsme_task(url: str):
    parser = FanficsmeParser()
    return parser.parse(url)

@flow
def fanficsme_flow(url: str):
    return parse_fanficsme_task(url)
