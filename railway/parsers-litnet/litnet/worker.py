from prefect import flow, task
from .parser import LitnetParser

@task
def parse_litnet_task(url: str):
    parser = LitnetParser()
    return parser.parse(url)

@flow
def litnet_flow(url: str):
    return parse_litnet_task(url)
