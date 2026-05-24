{-# LANGUAGE NoRebindableSyntax #-}
{-# OPTIONS_GHC -fno-warn-missing-import-lists #-}
{-# OPTIONS_GHC -w #-}
module PackageInfo_saudetracker (
    name,
    version,
    synopsis,
    copyright,
    homepage,
  ) where

import Data.Version (Version(..))
import Prelude

name :: String
name = "saudetracker"
version :: Version
version = Version [0,1,0,0] []

synopsis :: String
synopsis = "Sistema de acompanhamento de sa\250de pessoal"
copyright :: String
copyright = ""
homepage :: String
homepage = "https://github.com/GabC-dev/saudetracker"
