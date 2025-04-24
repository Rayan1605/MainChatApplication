#!/bin/bash
#
# messy_fake_commits.sh
# backdate both author and committer dates for commits 2025-04-24 → 2025-07-14
# high activity early, break week, random skips
#

FILE="progress.log"
START_DATE="2025-04-24"
END_DATE="2025-08-31"
HIGH_END="2025-05-17"
BREAK_START="2025-06-07"
BREAK_END="2025-06-13"

# convert dates to seconds since epoch
start=$(date -d "$START_DATE" +%s)
end=$(date -d "$END_DATE"   +%s)

# reset the dummy file
echo "" > "$FILE"

while [ $start -le $end ]; do
  day=$(date -d "@$start" +%Y-%m-%d)
  dow=$(date -d "$day" +%u)  # 1=Mon ... 7=Sun

  # skip weekends
  if [ $dow -gt 5 ]; then
    start=$((start + 86400))
    continue
  fi

  # skip break week
  if [[ "$day" > "$BREAK_START" && "$day" < "$BREAK_END" ]]; then
    start=$((start + 86400))
    continue
  fi

  # ~20% random skip
  if (( RANDOM % 5 == 0 )); then
    start=$((start + 86400))
    continue
  fi

  # decide commits/day
  if [[ "$day" < "$HIGH_END" ]]; then
    count=$(( RANDOM % 4 + 2 ))   # 2–5 commits early
  else
    count=$(( RANDOM % 3 ))       # 0–2 commits later
  fi

  for ((i=0; i<count; i++)); do
    h=$(( RANDOM % 14 + 9 ))
    m=$(( RANDOM % 60 ))
    s=$(( RANDOM % 60 ))
    ts="$day $(printf " %02d:%02d:%02d" $h $m $s)"

    # record progress
    echo "Work at $ts" >> "$FILE"
    git add "$FILE"

    # backdate both author and committer dates
    GIT_AUTHOR_DATE="$ts" GIT_COMMITTER_DATE="$ts" \
      git commit -m "Project"
  done

  start=$((start + 86400))
done

# push changes to current branch (master)
git push
