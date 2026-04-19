#!/bin/bash
# 🔍 SCANNER ABRIL 2026 (Via Tor)

export TARGET="https://oceandrivecarental.com/server/public"
TOR="socks5h://127.0.0.1:9050"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

echo "=== 🔍 SCANNER ABRIL 2026 (Via Tor) ==="
echo "FECHA      | ECON | COMP | COMP+| SUV  | SUV+"
echo "-----------|------|------|------|------|------"
for i in $(seq 18 30); do
    F="2026-04-$i"; M="2026-04-$((i+1))"
    [ $i -eq 30 ] && M="2026-05-01"
    
    R=$(curl -s -x $TOR -H "User-Agent: $UA" "$TARGET/bookings/availability?start_date=$F&end_date=$M&pickup_time=12:30&dropoff_time=10:00")
    
    S=$(echo "$R" | jq -r 'def c(id): (map(select(.id==id))|.[0].is_available); "\(if c(1) then " ✅ " else " ❌ " end)|\(if c(2) then " ✅ " else " ❌ " end)|\(if c(3) then " ✅ " else " ❌ " end)|\(if c(4) then " ✅ " else " ❌ " end)|\(if c(5) then " ⚠️ " else " ❌ " end)"')
    
    echo "$F |$S"
done
