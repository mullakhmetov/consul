/* eslint no-console: "off" */
export default function(scenario, assert, find, currentPage, pauseUntil) {
  scenario
    .then('I see $property on the $component like yaml\n$yaml', function(
      property,
      component,
      yaml
    ) {
      return pauseUntil(function(resolve, reject) {
        const _component = currentPage()[component];
        // this will catch if we get aren't managing to select a component
        if (_component.length === 0) {
          return Promise.resolve();
        }
        const iterator = new Array(_component.length).fill(true);

        let pass = true;
        iterator.forEach(function(item, i, arr) {
          const actual =
            typeof _component.objectAt(i)[property] === 'undefined'
              ? null
              : _component.objectAt(i)[property];

          // anything coming from the DOM is going to be text/strings
          // if the yaml has numbers, cast them to strings
          // TODO: This would get problematic for deeper objects
          // will have to look to do this recursively
          const expected = typeof yaml[i] === 'number' ? yaml[i].toString() : yaml[i];
          assert.deepEqual(
            actual,
            expected,
            `Expected to see ${property} on ${component}[${i}] as ${JSON.stringify(
              expected
            )}, was ${JSON.stringify(actual)}`
          );
          if (actual !== expected) {
            pass = false;
          }
        });
        if (pass) {
          return resolve();
        } else {
          return reject();
        }
      }, `Expected to see ${property} on ${component} equal to specific data`);
    })
    .then(['I see $property on the $component'], function(property, component) {
      return pauseUntil(function(resolve, reject) {
        // TODO: Time to work on repetition
        // Collection
        let obj;
        if (typeof currentPage()[component].objectAt === 'function') {
          obj = currentPage()[component].objectAt(0);
        } else {
          obj = currentPage()[component];
        }
        let _component;
        if (typeof obj === 'function') {
          const func = obj[property].bind(obj);
          try {
            _component = func();
          } catch (e) {
            return Promise.resolve();
          }
        } else {
          _component = obj;
        }
        try {
          obj = _component[property];
        } catch (e) {
          return Promise.resolve();
        }
        if (obj) {
          return resolve();
        } else {
          return reject();
        }
      }, `Expected to see ${property} on ${component}`);
    })
    .then(['I see $num of the $component object'], function(num, component) {
      return pauseUntil(function(resolve, reject) {
        let obj;
        try {
          obj = currentPage()[component];
        } catch (e) {
          return Promise.resolve();
        }
        if (obj.length !== parseInt(num)) {
          return reject();
        }
        return resolve();
      }, `Expected to see ${num} items in the ${component} object`);
    })
    .then(["I don't see $property on the $component"], function(property, component) {
      // Collection
      var obj;
      if (typeof currentPage()[component].objectAt === 'function') {
        obj = currentPage()[component].objectAt(0);
      } else {
        obj = currentPage()[component];
      }
      assert.throws(
        function() {
          const func = obj[property].bind(obj);
          func();
        },
        function(e) {
          return e.message.startsWith('Element not found');
        },
        `Expected to not see ${property} on ${component}`
      );
    })
    .then(["I don't see $property"], function(property) {
      assert.throws(
        function() {
          return currentPage()[property]();
        },
        function(e) {
          return e.message.startsWith('Element not found');
        },
        `Expected to not see ${property}`
      );
    })
    .then(['I see $property'], function(property) {
      assert.ok(currentPage()[property], `Expected to see ${property}`);
    })
    .then(
      [
        'I see $property on the $component like "$value"',
        "I see $property on the $component like '$value'",
      ],
      function(property, component, value) {
        return pauseUntil(function(resolve, reject) {
          let prop = property;
          if (typeof component === 'string') {
            prop = `${component}.${prop}`;
          }
          let target;
          try {
            target = find(prop);
          } catch (e) {
            return Promise.resolve();
          }
          if (target === value) {
            return resolve();
          } else {
            return reject();
          }
        }, `Expected to see ${property} on ${component} as ${value}`);
      }
    )
    .then(['I see $property like "$value"'], function(property, value) {
      return pauseUntil(function(resolve, reject) {
        let target;
        try {
          target = currentPage()[property];
        } catch (e) {
          return Promise.resolve();
        }
        if (target === value) {
          return resolve();
        } else {
          return reject();
        }
      }, `Expected to see ${property} as ${value}`);
    });
}
