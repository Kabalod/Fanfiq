#!/usr/bin/env python3
"""
Fanfiq Health Check Script
Checks the health of all services and dependencies
"""

import asyncio
import sys
from typing import Dict, List
import aiohttp
import asyncpg
import redis.asyncio as redis
import pika


class ServiceChecker:
    def __init__(self):
        self.results = {}

    async def check_postgres(self, host: str = "localhost", port: int = 54390,
                           user: str = "fanfiq", password: str = "fanfiq_password",
                           database: str = "fanfiq") -> bool:
        """Check PostgreSQL connection"""
        try:
            conn = await asyncpg.connect(
                host=host, port=port, user=user,
                password=password, database=database
            )
            await conn.close()
            return True
        except Exception as e:
            print(f"PostgreSQL check failed: {e}")
            return False

    async def check_redis(self, host: str = "localhost", port: int = 63790) -> bool:
        """Check Redis connection"""
        try:
            r = redis.Redis(host=host, port=port)
            await r.ping()
            await r.close()
            return True
        except Exception as e:
            print(f"Redis check failed: {e}")
            return False

    async def check_api(self, url: str = "http://localhost:58090/docs") -> bool:
        """Check API health"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    return response.status == 200
        except Exception as e:
            print(f"API check failed: {e}")
            return False

    def check_rabbitmq(self, host: str = "localhost", port: int = 56790,
                      user: str = "fanfiq", password: str = "rabbitmq_password") -> bool:
        """Check RabbitMQ connection"""
        try:
            credentials = pika.PlainCredentials(user, password)
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=host, port=port, credentials=credentials)
            )
            connection.close()
            return True
        except Exception as e:
            print(f"RabbitMQ check failed: {e}")
            return False

    async def run_all_checks(self) -> Dict[str, bool]:
        """Run all health checks"""
        print("🔍 Running health checks...\n")

        checks = {
            "PostgreSQL": self.check_postgres(),
            "Redis": self.check_redis(),
            "API": self.check_api(),
            "RabbitMQ": self.check_rabbitmq(),
        }

        results = {}
        for name, check_coro in checks.items():
            print(f"Checking {name}...", end=" ")
            try:
                if asyncio.iscoroutine(check_coro):
                    result = await check_coro
                else:
                    result = await asyncio.get_event_loop().run_in_executor(None, check_coro)
                results[name] = result
                status = "✅" if result else "❌"
                print(f"{status}")
            except Exception as e:
                results[name] = False
                print(f"❌ (Error: {e})")

        return results

    def print_summary(self, results: Dict[str, bool]):
        """Print health check summary"""
        print("\n📊 Health Check Summary:")
        print("=" * 30)

        all_healthy = True
        for service, healthy in results.items():
            status = "✅ Healthy" if healthy else "❌ Unhealthy"
            print(f"{service:12} {status}")
            if not healthy:
                all_healthy = False

        print("=" * 30)
        if all_healthy:
            print("🎉 All services are healthy!")
            return 0
        else:
            print("⚠️  Some services are unhealthy. Check logs for details.")
            return 1


async def main():
    """Main function"""
    checker = ServiceChecker()
    results = await checker.run_all_checks()
    exit_code = checker.print_summary(results)
    sys.exit(exit_code)


if __name__ == "__main__":
    asyncio.run(main())
