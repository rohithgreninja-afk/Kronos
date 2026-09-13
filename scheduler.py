# scheduler.py — Kronos scheduling algorithms
# See PHASE_1_INSTRUCTIONS.md → File 2 for full spec
# 4 functions to implement: fcfs, sjf, priority_scheduling, round_robin

import copy
from collections import deque

from process import Process


def _finalize(procs, timeline, order):
    proc_map = {p.pid: p for p in procs}
    metrics = []
    tat_sum = wt_sum = 0
    for p in order:
        proc = proc_map[p.pid]
        proc.TAT = proc.completion_time - proc.arrival_time
        proc.WT = proc.TAT - proc.burst_time
        proc.RT = proc.start_time - proc.arrival_time
        metrics.append(
            {
                "pid": proc.pid,
                "CT": proc.completion_time,
                "TAT": proc.TAT,
                "WT": proc.WT,
                "RT": proc.RT,
            }
        )
        tat_sum += proc.TAT
        wt_sum += proc.WT
    n = len(order)
    return {
        "timeline": timeline,
        "metrics": metrics,
        "averages": {
            "avg_TAT": tat_sum / n if n else 0.0,
            "avg_WT": wt_sum / n if n else 0.0,
        },
    }


def fcfs(processes):
    procs = copy.deepcopy(processes)
    procs.sort(key=lambda p: (p.arrival_time, p.pid))

    timeline = []
    current_time = 0

    for p in procs:
        if current_time < p.arrival_time:
            current_time = p.arrival_time

        start = current_time
        if p.start_time == -1:
            p.start_time = start

        end = start + p.burst_time
        p.completion_time = end
        p.state = "Terminated"
        current_time = end

        timeline.append({"pid": p.pid, "start": start, "end": end})

    return _finalize(procs, timeline, processes)


def sjf(processes):
    procs = copy.deepcopy(processes)
    timeline = []
    current_time = 0
    remaining = list(procs)

    while remaining:
        arrived = [p for p in remaining if p.arrival_time <= current_time]
        if not arrived:
            current_time = min(p.arrival_time for p in remaining)
            continue

        p = min(arrived, key=lambda x: (x.burst_time, x.arrival_time, x.pid))
        remaining.remove(p)

        start = current_time
        if p.start_time == -1:
            p.start_time = start

        end = start + p.burst_time
        p.completion_time = end
        p.state = "Terminated"
        current_time = end

        timeline.append({"pid": p.pid, "start": start, "end": end})

    return _finalize(procs, timeline, processes)


def priority_scheduling(processes):
    procs = copy.deepcopy(processes)
    timeline = []
    current_time = 0
    remaining = list(procs)

    while remaining:
        arrived = [p for p in remaining if p.arrival_time <= current_time]
        if not arrived:
            current_time = min(p.arrival_time for p in remaining)
            continue

        p = min(arrived, key=lambda x: (x.priority, x.arrival_time, x.pid))
        remaining.remove(p)

        start = current_time
        if p.start_time == -1:
            p.start_time = start

        end = start + p.burst_time
        p.completion_time = end
        p.state = "Terminated"
        current_time = end

        timeline.append({"pid": p.pid, "start": start, "end": end})

    return _finalize(procs, timeline, processes)


def round_robin(processes, quantum):
    procs = copy.deepcopy(processes)
    procs.sort(key=lambda p: p.arrival_time)

    timeline = []
    ready = deque()
    current_time = 0
    last_time = 0
    enqueued = set()

    for p in procs:
        if p.arrival_time == 0:
            ready.append(p)
            enqueued.add(p.pid)

    def enqueue_new_arrivals():
        for p in procs:
            if p.pid not in enqueued and last_time < p.arrival_time <= current_time:
                ready.append(p)
                enqueued.add(p.pid)

    while ready or len(enqueued) < len(procs) or any(
        p.state != "Terminated" for p in procs
    ):
        if not ready:
            pending = [p for p in procs if p.pid not in enqueued]
            if not pending:
                break
            next_time = min(p.arrival_time for p in pending)
            last_time = current_time
            current_time = next_time
            enqueue_new_arrivals()
            last_time = current_time
            continue

        p = ready.popleft()

        if p.start_time == -1:
            p.start_time = current_time

        time_slice = min(p.remaining_time, quantum)
        start = current_time
        end = current_time + time_slice

        timeline.append({"pid": p.pid, "start": start, "end": end})

        current_time += time_slice
        p.remaining_time -= time_slice

        enqueue_new_arrivals()
        last_time = current_time

        if p.remaining_time > 0:
            ready.append(p)
        else:
            p.completion_time = current_time
            p.state = "Terminated"

    return _finalize(procs, timeline, processes)
