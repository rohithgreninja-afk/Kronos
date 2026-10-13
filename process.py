# process.py: Kronos PCB (Process Control Block) data model
# See PHASE_1_INSTRUCTIONS.md → File 1 for full spec

class Process:
    def __init__(self, pid, arrival_time, burst_time, priority):
        self.pid = pid
        self.arrival_time = arrival_time
        self.burst_time = burst_time
        self.priority = priority
        self.remaining_time = burst_time
        self.state = "New"
        self.start_time = -1
        self.completion_time = 0
        self.TAT = 0
        self.WT = 0
        self.RT = 0

    def __repr__(self):
        return f"Process(pid={self.pid}, AT={self.arrival_time}, BT={self.burst_time}, State={self.state})"
