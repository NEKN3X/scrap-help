import gleam/option.{None, Some}
import monadic_parser/parser as mp
import scrapbox/node/hashtag
import scrapbox/node/node.{HashTag, Plain}

pub fn hashtag_test() {
  let p = hashtag.parser(node.Options(..node.default_options(), start: True))
  assert mp.parse(p, "#hashtag")
    == Some(#([HashTag("#hashtag", "hashtag")], ""))
  assert mp.parse(p, "　#hashtag with space")
    == Some(#([Plain("　"), HashTag("#hashtag", "hashtag")], " with space"))
  assert mp.parse(p, "# hashtag with space") == None
}
