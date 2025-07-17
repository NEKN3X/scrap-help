import gleam/option.{None, Some}
import monadic_parser/parser.{parse}
import scrapbox/node/command_line
import scrapbox/node/node.{CommandLine}

pub fn command_line_test() {
  let p = command_line.parser()
  assert parse(p, "$ command line")
    == Some(#(CommandLine("$ command line", "$", "command line"), ""))
  assert parse(p, "% another command line")
    == Some(#(
      CommandLine("% another command line", "%", "another command line"),
      "",
    ))
  assert parse(p, "$command line without space") == None
  assert parse(p, "%command line without space") == None
  assert parse(p, "%") == None
}
