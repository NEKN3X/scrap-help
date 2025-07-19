import gleam/option.{None, Some}
import monadic_parser/parser.{parse}
import scrapbox/node/icon
import scrapbox/node/node.{Icon}

pub fn icon_test() {
  let p = icon.parser(node.default_options())
  assert parse(p, "[aaa.icon]") == Some(#([Icon("[aaa.icon]", "aaa")], ""))
  assert parse(p, "[aaa.icon*2]")
    == Some(#([Icon("[aaa.icon*2]", "aaa"), Icon("[aaa.icon*2]", "aaa")], ""))
  assert parse(p, "[aaa.icon ]") == None
}
