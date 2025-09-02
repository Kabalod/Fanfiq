from parsers.ficbook.worker import ficbook_flow
from parsers.authortoday.worker import authortoday_flow
from parsers.litnet.worker import litnet_flow
from parsers.fanficsme.worker import fanficsme_flow

# This file can be used to register all flows with Prefect
# For now, we just re-export them
__all__ = ["ficbook_flow", "authortoday_flow", "litnet_flow", "fanficsme_flow"]


