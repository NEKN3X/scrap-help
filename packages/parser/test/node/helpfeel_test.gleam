import gleam/option.{None, Some}
import monadic_parser/parser.{parse}
import scrapbox/node/helpfeel
import scrapbox/node/node.{Helpfeel}

pub fn helpfeel_test() {
  let p = helpfeel.parser(node.Options(..node.default_options(), start: True))
  assert parse(p, "? [abc]") == Some(#(Helpfeel("? [abc]", "[abc]"), ""))
  assert parse(p, "?abc") == None
  assert parse(p, "abc ? abc") == None
}
