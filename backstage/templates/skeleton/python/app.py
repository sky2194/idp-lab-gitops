from flask import Flask, jsonify
from flask_cors import CORS
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

MERCHANTS = [
    "Starbucks", "Amazon", "Netflix", "Uber", "Apple Store",
    "Whole Foods", "Spotify", "Shell Gas", "Target", "Airbnb"
]

CATEGORIES = [
    "Food & Drink", "Shopping", "Entertainment", "Transport",
    "Utilities", "Travel", "Health", "Groceries"
]

def generate_transactions(n=10):
    transactions = []
    for i in range(n):
        amount = round(random.uniform(5.0, 500.0), 2)
        status = random.choice(["completed", "completed", "completed", "pending", "failed"])
        date = datetime.now() - timedelta(days=random.randint(0, 30))
        transactions.append({
            "id": f"TXN{1000 + i}",
            "merchant": random.choice(MERCHANTS),
            "category": random.choice(CATEGORIES),
            "amount": amount,
            "currency": "USD",
            "status": status,
            "date": date.strftime("%Y-%m-%d %H:%M"),
            "card": f"**** **** **** {random.randint(1000, 9999)}"
        })
    return sorted(transactions, key=lambda x: x["date"], reverse=True)

@app.route("/")
def index():
    return jsonify({
        "service": "payment-service",
        "version": "1.0.0",
        "status": "healthy"
    })

@app.route("/health")
def health():
    return jsonify({"status": "healthy"})

@app.route("/api/transactions")
def transactions():
    return jsonify({
        "transactions": generate_transactions(10),
        "total": 10
    })

@app.route("/api/summary")
def summary():
    txns = generate_transactions(20)
    total_spent = sum(t["amount"] for t in txns if t["status"] == "completed")
    pending = sum(1 for t in txns if t["status"] == "pending")
    failed = sum(1 for t in txns if t["status"] == "failed")
    return jsonify({
        "total_spent": round(total_spent, 2),
        "transaction_count": len(txns),
        "pending_count": pending,
        "failed_count": failed,
        "currency": "USD"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
