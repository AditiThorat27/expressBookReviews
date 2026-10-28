#!/bin/bash
# Creates the nine submission files (command + output).
# Start the server first (node index.js), in another terminal.
# Restart the server before re-running, because users are stored in memory.

BASE="http://localhost:5000"
JAR="cookies.txt"
rm -f "$JAR"

# save <output file> <command text to show> <curl arguments...>
save() {
  local name="$1" shown="$2"
  shift 2
  {
    echo "\$ $shown"
    echo
    curl -s "$@"
    echo
  } > "$name"
  echo "===== $name ====="
  cat "$name"
  echo
}

save getallbooks     "curl -s $BASE/" "$BASE/"
save getbooksbyISBN  "curl -s $BASE/isbn/1" "$BASE/isbn/1"
save getbooksbyauthor "curl -s \"$BASE/author/Jane%20Austen\"" "$BASE/author/Jane%20Austen"
save getbooksbytitle "curl -s \"$BASE/title/Pride%20and%20Prejudice\"" "$BASE/title/Pride%20and%20Prejudice"
save getbookreview   "curl -s $BASE/review/1" "$BASE/review/1"

save register "curl -s -X POST -H 'Content-Type: application/json' -d '{\"username\":\"aditi\",\"password\":\"pass123\"}' $BASE/register" \
  -X POST -H 'Content-Type: application/json' -d '{"username":"aditi","password":"pass123"}' "$BASE/register"

save login "curl -s -c cookies.txt -X POST -H 'Content-Type: application/json' -d '{\"username\":\"aditi\",\"password\":\"pass123\"}' $BASE/customer/login" \
  -c "$JAR" -X POST -H 'Content-Type: application/json' -d '{"username":"aditi","password":"pass123"}' "$BASE/customer/login"

save reviewadded "curl -s -b cookies.txt -X PUT \"$BASE/customer/auth/review/1?review=Great%20book\"" \
  -b "$JAR" -X PUT "$BASE/customer/auth/review/1?review=Great%20book"

save deletereview "curl -s -b cookies.txt -X DELETE $BASE/customer/auth/review/1" \
  -b "$JAR" -X DELETE "$BASE/customer/auth/review/1"

echo "Done. Files created: getallbooks getbooksbyISBN getbooksbyauthor getbooksbytitle getbookreview register login reviewadded deletereview"