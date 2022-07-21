import { Command, Context, Settings } from '../lib/settings';

test('can delete values from Context object', () => {
  // GIVEN
  const settings1 = new Settings({ foo: 'bar' });
  const settings2 = new Settings({ boo: 'baz' });
  const context = new Context(settings1, settings2);

  // WHEN
  context.unset('foo');

  // THEN
  expect(context.all).toEqual({ boo: 'baz' });
  expect(settings1.all).toEqual({});
  expect(settings2.all).toEqual({ boo: 'baz' });
});

test('can set values in Context object', () => {
  // GIVEN
  const settings1 = new Settings();
  const settings2 = new Settings();
  const context = new Context(settings1, settings2);

  // WHEN
  context.set('foo', 'bar');

  // THEN
  expect(context.all).toEqual({ foo: 'bar' });
  expect(settings1.all).toEqual({ foo: 'bar' });
  expect(settings2.all).toEqual({});
});

test('can set values in Context object if first is immutable', () => {
  // GIVEN
  const settings1 = new Settings();
  const settings2 = new Settings();
  const context = new Context(settings1.makeReadOnly(), settings2);

  // WHEN
  context.set('foo', 'bar');

  // THEN
  expect(context.all).toEqual({ foo: 'bar' });
  expect(settings1.all).toEqual({ });
  expect(settings2.all).toEqual({ foo: 'bar' });
});

test('can clear all values in all objects', () => {
  // GIVEN
  const settings1 = new Settings({ foo: 'bar' });
  const settings2 = new Settings({ foo: 'snar', boo: 'gar' });
  const context = new Context(settings1, settings2);

  // WHEN
  context.clear();

  // THEN
  expect(context.all).toEqual({});
  expect(settings1.all).toEqual({ });
  expect(settings2.all).toEqual({});
});

test('can parse string context from command line arguments', () => {
  // GIVEN
  const settings1 = Settings.fromCommandLineArguments({ context: ['foo=bar'], _: [Command.DEPLOY] });
  const settings2 = Settings.fromCommandLineArguments({ context: ['foo='], _: [Command.DEPLOY] });

  // THEN
  expect(settings1.get(['context']).foo).toEqual( 'bar');
  expect(settings2.get(['context']).foo).toEqual( '');
});

test('can parse string context from command line arguments with equals sign in value', () => {
  // GIVEN
  const settings1 = Settings.fromCommandLineArguments({ context: ['foo==bar='], _: [Command.DEPLOY] });
  const settings2 = Settings.fromCommandLineArguments({ context: ['foo=bar='], _: [Command.DEPLOY] });

  // THEN
  expect(settings1.get(['context']).foo).toEqual( '=bar=');
  expect(settings2.get(['context']).foo).toEqual( 'bar=');
});

test('can parse context from command line arguments and convert value to correct type', () => {
  // GIVEN
  const settings1 = Settings.fromCommandLineArguments({ context: ['foo=false'], _: [Command.DEPLOY] });
  const settings2 = Settings.fromCommandLineArguments({ context: ['foo=0'], _: [Command.DEPLOY] });
  const settings3 = Settings.fromCommandLineArguments({ context: ['foo=true'], _: [Command.DEPLOY] });
  const settings4 = Settings.fromCommandLineArguments({ context: ['foo={"a": "b", "c": true, "d": ["a", "b"]}'], _: [Command.DEPLOY] });
  const settings5 = Settings.fromCommandLineArguments({ context: ['foo=34'], _: [Command.DEPLOY] });
  const settings6 = Settings.fromCommandLineArguments({ context: ['foo=34 35'], _: [Command.DEPLOY] });
  const settings7 = Settings.fromCommandLineArguments({ context: ['foo=0x22'], _: [Command.DEPLOY] });

  // THEN
  expect(settings1.get(['context']).foo).toEqual(false);
  expect(settings2.get(['context']).foo).toEqual(0);
  expect(settings3.get(['context']).foo).toEqual(true);
  expect(settings4.get(['context']).foo).toEqual({ a: 'b', c: true, d: ['a', 'b'] });
  expect(settings5.get(['context']).foo).toEqual(34);
  expect(settings6.get(['context']).foo).toEqual('34 35');
  expect(settings7.get(['context']).foo).toEqual('0x22');
});

test('bundling stacks defaults to an empty list', () => {
  // GIVEN
  const settings = Settings.fromCommandLineArguments({
    _: [Command.LIST],
  });

  // THEN
  expect(settings.get(['bundlingStacks'])).toEqual([]);
});

test('bundling stacks defaults to * for deploy', () => {
  // GIVEN
  const settings = Settings.fromCommandLineArguments({
    _: [Command.DEPLOY],
  });

  // THEN
  expect(settings.get(['bundlingStacks'])).toEqual(['*']);
});

test('bundling stacks defaults to * for watch', () => {
  // GIVEN
  const settings = Settings.fromCommandLineArguments({
    _: [Command.WATCH],
  });

  // THEN
  expect(settings.get(['bundlingStacks'])).toEqual(['*']);
});

test('bundling stacks with deploy exclusively', () => {
  // GIVEN
  const settings = Settings.fromCommandLineArguments({
    _: [Command.DEPLOY],
    exclusively: true,
    STACKS: ['cool-stack'],
  });

  // THEN
  expect(settings.get(['bundlingStacks'])).toEqual(['cool-stack']);
});

test('bundling stacks with watch exclusively', () => {
  // GIVEN
  const settings = Settings.fromCommandLineArguments({
    _: [Command.WATCH],
    exclusively: true,
    STACKS: ['cool-stack'],
  });

  // THEN
  expect(settings.get(['bundlingStacks'])).toEqual(['cool-stack']);
});

test('should include outputs-file in settings', () => {
  // GIVEN
  const settings = Settings.fromCommandLineArguments({
    _: [Command.DEPLOY],
    outputsFile: 'my-outputs-file.json',
  });

  // THEN
  expect(settings.get(['outputsFile'])).toEqual('my-outputs-file.json');
});

test('providing a build arg', () => {
  // GIVEN
  const settings = Settings.fromCommandLineArguments({
    _: [Command.SYNTH],
    build: 'mvn package',
  });

  // THEN
  expect(settings.get(['build'])).toEqual('mvn package');
});
