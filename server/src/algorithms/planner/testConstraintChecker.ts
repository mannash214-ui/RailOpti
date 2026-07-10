import { ConstraintChecker } from './ConstraintChecker';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`\x1b[31m[Assertion Failed] ${message}\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m[Passed] ${message}\x1b[0m`);
  }
}

function runTests() {
  console.log('\x1b[36m[ConstraintChecker Unit Tests] Running assertions...\x1b[0m');

  // Test 1: Empty allowed train types should allow any train type
  assert(
    ConstraintChecker.isTrainTypeAllowed('Shatabdi', []),
    'Allow "Shatabdi" when allowedTrainTypes is empty'
  );
  assert(
    ConstraintChecker.isTrainTypeAllowed('Express', []),
    'Allow "Express" when allowedTrainTypes is empty'
  );

  // Test 2: Case-insensitive and trimmed spaces checks
  const allowed = ['Shatabdi', 'Rajdhani'];

  assert(
    ConstraintChecker.isTrainTypeAllowed('Shatabdi', allowed),
    'Allow exact match "Shatabdi"'
  );
  assert(
    ConstraintChecker.isTrainTypeAllowed('shatabdi', allowed),
    'Allow lowercased match "shatabdi"'
  );
  assert(
    ConstraintChecker.isTrainTypeAllowed('  Rajdhani  ', allowed),
    'Allow whitespace padded match "  Rajdhani  "'
  );
  assert(
    ConstraintChecker.isTrainTypeAllowed('rajdhani', allowed),
    'Allow lowercased match "rajdhani"'
  );

  // Test 3: Rejecting disallowed train types
  assert(
    !ConstraintChecker.isTrainTypeAllowed('Express', allowed),
    'Reject disallowed train type "Express"'
  );
  assert(
    !ConstraintChecker.isTrainTypeAllowed('Superfast', allowed),
    'Reject disallowed train type "Superfast"'
  );

  // Test 4: Handling of whitespace in allowed list
  const allowedWithSpaces = ['  Superfast  ', 'Express'];
  assert(
    ConstraintChecker.isTrainTypeAllowed('superfast', allowedWithSpaces),
    'Allow train type matching spaced value "  Superfast  " case-insensitively'
  );

  console.log('\n\x1b[32m[ConstraintChecker Unit Tests] All assertions passed successfully!\x1b[0m\n');
}

runTests();
