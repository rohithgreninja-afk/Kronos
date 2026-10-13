<div align="center">

# ⏱ KRONOS

### CPU Scheduling Simulator

A locally-hosted web app that simulates OS CPU scheduling algorithms
with animated Gantt charts, real-time PCB state tracking, and process metrics.

![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

</div>

---

## Features

- **4 scheduling algorithms** - FCFS, SJF, Priority, Round Robin
- **Animated Gantt chart** - live visual timeline per simulation run
- **Process metrics** - CT, TAT, WT, RT per process with computed averages
- **Dark Cherry + Glassmorphism UI** - high-contrast deep red and black design
- **REST API** - `/schedule` endpoint accepts JSON, returns structured results
- **Stateless** - no database, runs entirely in memory

---

## Algorithms

| Algorithm | Preemptive | Strategy |
|-----------|------------|----------|
| FCFS | No | First arrival gets CPU first |
| SJF | No | Shortest burst time runs next |
| Priority | No | Lowest priority number runs next |
| Round Robin | Yes | Each process gets a fixed time quantum |

---

## Setup

**Prerequisites:** Python 3.8+

```bash
git clone https://github.com/rohithgreninja-afk/Kronos.git
cd Kronos
pip install flask
python app.py
```

Open **http://localhost:5000** in your browser.

---

## API Reference

`POST /schedule`

**Request:**
```json
{
  "processes": [
    { "pid": "P1", "arrival_time": 0, "burst_time": 5, "priority": 2 },
    { "pid": "P2", "arrival_time": 2, "burst_time": 3, "priority": 1 }
  ],
  "algorithm": "rr",
  "quantum": 2
}
```

**Response:**
```json
{
  "timeline": [
    { "pid": "P1", "start": 0, "end": 2 },
    { "pid": "P2", "start": 2, "end": 4 }
  ],
  "metrics": [
    { "pid": "P1", "CT": 5, "TAT": 5, "WT": 0, "RT": 0 },
    { "pid": "P2", "CT": 4, "TAT": 2, "WT": -1, "RT": 0 }
  ],
  "averages": { "avg_TAT": 3.5, "avg_WT": -0.5 }
}
```

**Supported algorithm values:** `fcfs` · `sjf` · `priority` · `rr`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3 + Flask |
| Frontend | Vanilla JS + HTML |
| Styling | Pure CSS, Glassmorphism |

---

## Project Structure

```
Kronos/
├── app.py              # Flask server + API routes
├── process.py          # PCB (Process Control Block) data model
├── scheduler.py        # Scheduling algorithm implementations
├── requirements.txt
├── static/
│   ├── css/style.css   # Dark Cherry + Glassmorphism design
│   └── js/main.js      # UI logic, API calls, Gantt rendering
└── templates/
    └── index.html      # Single page app shell
```

---

<div align="center">

Built by **Rohith Ram V** - VIT Vellore, B.Tech CSE (5th Sem)
OS Lab Mini Project - BCSE303L

</div>
