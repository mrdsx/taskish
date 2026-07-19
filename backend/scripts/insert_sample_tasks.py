import asyncio
import random

from src.db import get_session
from src.db.tasks import DB_Task


async def main():
    tasks_len = 10

    async for session in get_session():
        for task_index in range(tasks_len):
            sub_tasks_len = random.randint(1, 4)
            sub_tasks = []

            for sub_task_index in range(sub_tasks_len):
                sub_tasks.append(f"Sub task {sub_task_index + 1}")

            new_task = DB_Task(
                title=f"Task {task_index + 1}",
                sub_tasks=sub_tasks,
                expires_at=None,
            )
            session.add(new_task)

        await session.commit()

    print(f"Added tasks: {tasks_len}")


if __name__ == "__main__":
    asyncio.run(main())
