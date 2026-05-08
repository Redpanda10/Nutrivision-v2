# TODO - Nutrivision

- [ ] Update `/n-backend/controllers/foodController.js`:
  - [ ] Add fallback safety/nutrition when YOLO or USDA fails
  - [ ] Ensure `safetyCheck.isSafe` becomes `false` (or at least not “safe”) when nutrition verification fails
- [ ] Update `/n-backend/test.js`:
  - [ ] Remove dummy-file creation
  - [ ] Fail fast if `pine.jpeg` missing
- [ ] Run `node n-backend/test.js` to verify `safetyCheck` + nutrition appear in response


