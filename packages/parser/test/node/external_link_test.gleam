import gleam/option.{None, Some}
import monadic_parser/parser as mp
import scrapbox/node/external_link
import scrapbox/node/node.{ExternalLink}

pub fn external_link_test() {
  let p = external_link.parser(node.Options(False, False, False))
  assert mp.parse(p, "[http://example.com]")
    == Some(#(
      ExternalLink("[http://example.com]", "http://example.com", ""),
      "",
    ))
  assert mp.parse(p, "[https://example.com link text]")
    == Some(#(
      ExternalLink(
        "[https://example.com link text]",
        "https://example.com",
        "link text",
      ),
      "",
    ))
  assert mp.parse(p, "[link text https://example.com]")
    == Some(#(
      ExternalLink(
        "[link text https://example.com]",
        "https://example.com",
        "link text",
      ),
      "",
    ))
  assert mp.parse(p, "[http://example.com ]]")
    == Some(#(
      ExternalLink("[http://example.com ]]", "http://example.com", "]"),
      "",
    ))
  assert mp.parse(p, "[] http://example.com]")
    == Some(#(
      ExternalLink("[] http://example.com]", "http://example.com", "]"),
      "",
    ))
  assert mp.parse(p, "[abc[abc] http://example.com]")
    == Some(#(
      ExternalLink(
        "[abc[abc] http://example.com]",
        "http://example.com",
        "abc[abc]",
      ),
      "",
    ))
  assert mp.parse(p, "[ https://example.com link text]") == None
  assert mp.parse(p, "[link text]") == None
}
