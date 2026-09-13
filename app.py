# app.py — Kronos Flask entry point

from flask import Flask, request, jsonify, render_template
from scheduler import fcfs, sjf, priority_scheduling, round_robin
from process import Process

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/schedule', methods=['POST'])
def schedule():
    data = request.get_json()
    process_list = [
        Process(p['pid'], p['arrival_time'], p['burst_time'], p['priority'])
        for p in data['processes']
    ]
    algorithm = data.get('algorithm', 'fcfs')
    quantum = data.get('quantum', 2)

    if algorithm == 'fcfs':
        result = fcfs(process_list)
    elif algorithm == 'sjf':
        result = sjf(process_list)
    elif algorithm == 'priority':
        result = priority_scheduling(process_list)
    elif algorithm == 'rr':
        result = round_robin(process_list, quantum)
    else:
        return jsonify({'error': 'Unknown algorithm'}), 400

    response = jsonify(result)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route('/schedule', methods=['OPTIONS'])
def schedule_options():
    response = jsonify({})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response, 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
