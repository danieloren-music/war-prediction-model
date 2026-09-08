import os
import json
from http.server import BaseHTTPRequestHandler
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timedelta
from supabase import create_client, Client

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            url: str = os.environ.get("SUPABASE_URL")
            key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            supabase: Client = create_client(url, key)

            response = supabase.table("conflicts_dataset").select("*").execute()
            data = response.data

            if not data:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No data found"}).encode('utf-8'))
                return

            df = pd.DataFrame(data)

            X = np.array(range(len(df))).reshape(-1, 1)
            y = df['event_year'].values

            model = LinearRegression()
            model.fit(X, y)

            next_index = np.array([[len(df)]])
            predicted_year_float = model.predict(next_index)[0]

            recent_intensity_factor = df['intensity'].tail(5).mean() / 10.0
            
            base_year = int(predicted_year_float)
            fraction = (predicted_year_float - base_year) * (2 - recent_intensity_factor)
            predicted_date = datetime(base_year, 1, 1) + timedelta(days=max(30, fraction * 365))

            result = {
                "success": True,
                "predicted_date": predicted_date.strftime('%d/%m/%Y'),
                "mean_interval": round(float(df['time_interval'].mean()), 2),
                "total_events_analyzed": len(df),
                "average_recent_intensity": round(float(recent_intensity_factor * 10), 1)
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))