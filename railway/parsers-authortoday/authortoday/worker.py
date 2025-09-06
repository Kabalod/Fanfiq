from prefect import flow, task
from .parser import AuthorTodayParser

@task
def parse_authortoday_task(url: str):
    parser = AuthorTodayParser()
    return parser.parse(url)

@flow
def authortoday_flow(url: str):
    return parse_authortoday_task(url)
