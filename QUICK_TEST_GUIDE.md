# Quick Testing Guide - Phase 3 Enhanced Quizzes

## How to Test the New Features

### Open the File
```bash
# Navigate to development.html in your browser
open development.html
# or just double-click the file
```

### Test Each Quiz Section

#### Task 1: Expanded Form (Existing - Should Still Work)
1. Scroll to "Task 1: Expanded Form Practice"
2. Try entering: `2000+300+40+0` for question 1
3. Click "Check My Work"
4. Should see ✓ Correct! with green background

#### Task 2: Create Number (Existing - Should Still Work)
1. Scroll to "Task 2: Create a Number Challenge"
2. Enter: `4070` in "My number" field
3. Click "Check My Number"
4. Should see ✓ Correct! feedback

#### Task 3: Digit Value Quiz (NEW)
1. Scroll to "Task 3: Digit Value Quiz"
2. Select "6,000" for Q1 (6 in 6,823)
3. Select "40" for Q2 (4 in 2,145)
4. Enter "9" for Q3 (9 in 7,309)
5. Click "Check Answers"
6. Should see 3 green checkmarks

#### Task 4: Comparing Numbers (NEW)
1. Scroll to "Task 4: Comparing Numbers"
2. Select "<" for 3,456 ___ 3,465
3. Select "<" for 8,902 ___ 8,920
4. Select ">" for 5,000 ___ 4,999
5. Click "Check Answers"
6. Should see 3 green checkmarks with explanations

#### Task 5: Word Problems (NEW)
1. Scroll to "Task 5: Place Value Word Problems"
2. Enter "3208" for Q1 (base-10 blocks)
3. Enter "4" for Q2 (hundreds digit in 6,427)
4. Enter "4667" for Q3 (100 more than 4,567)
5. Click "Check Answers"
6. Should see 3 green checkmarks

#### Extension Challenge 2 (NEW)
1. Scroll to "Extension" section
2. Enter "9731" for Largest
3. Enter "1379" for Smallest
4. Click "Check"
5. Should see "✓ Largest correct! ✓ Smallest correct!"

## Expected Answers Quick Reference

| Task | Question | Correct Answer |
|------|----------|----------------|
| Task 1 | 2,340 = | 2000+300+40+0 |
| Task 1 | 5,678 = | 5000+600+70+8 |
| Task 1 | 1,009 = | 1000+0+0+9 |
| Task 1 | 8,520 = | 8000+500+20+0 |
| Task 1 | 3,407 = | 3000+400+0+7 |
| Task 2 | Create number | 4070 |
| Task 3 | Value of 6 in 6,823 | 6,000 |
| Task 3 | Value of 4 in 2,145 | 40 |
| Task 3 | Value of 9 in 7,309 | 9 |
| Task 4 | 3,456 ___ 3,465 | < |
| Task 4 | 8,902 ___ 8,920 | < |
| Task 4 | 5,000 ___ 4,999 | > |
| Task 5 | Base-10 blocks | 3208 |
| Task 5 | Hundreds in 6,427 | 4 |
| Task 5 | 100 more than 4,567 | 4667 |
| Extension | Largest (3,7,1,9) | 9731 |
| Extension | Smallest (3,7,1,9) | 1379 |

## Visual Checks

### Styling
- [ ] Purple gradient navbar at top
- [ ] Each quiz section has light gray background
- [ ] Extension section has orange/peach background
- [ ] Buttons are purple and hover effect works
- [ ] Input fields highlight purple on focus

### Feedback
- [ ] Correct answers show green background
- [ ] Incorrect answers show red/pink background
- [ ] Feedback messages are clear and helpful
- [ ] All feedback appears instantly on button click

### Responsive Design
- [ ] Try resizing browser window
- [ ] All quiz sections remain readable
- [ ] Buttons don't overlap on mobile
- [ ] Input fields scale appropriately

## Common Issues & Solutions

### "Function not defined" error
- **Cause:** app.js not loaded
- **Fix:** Check that `<script src="app.js">` is at bottom of HTML

### Feedback not showing
- **Cause:** Missing feedback div IDs
- **Fix:** Verify each question has matching feedback div

### Styling looks broken
- **Cause:** CSS not loaded
- **Fix:** Check that `<link rel="stylesheet" href="styles.css">` is in head

### Button click does nothing
- **Cause:** JavaScript function name mismatch
- **Fix:** Check onclick attribute matches function name in app.js

---

**Quick Test (1 minute):**
1. Open development.html
2. Try Task 3 Q1: Select "6,000" → Click Check → See green ✓
3. Try Task 4 Q1: Select "<" → Click Check → See green ✓
4. Try Extension: Enter "9731" and "1379" → Click Check → See green ✓

If all 3 work, the enhancement is successful!
