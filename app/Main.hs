{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeOperators #-}
module Main where

import Data.String (fromString)
import Data.ByteString.Char8 (pack)
import Network.Wai.Handler.Warp (runSettings, setPort, defaultSettings)
import Network.Wai (Middleware)
import Network.Wai.Middleware.Cors
import Servant
import Server.Routes
import Api.Model

-- Handlers da API
server :: Server SaudeAPI
server = listarUsuarios
    :<|> criarUsuario
    :<|> buscarUsuario
    :<|> listarMetricas
    :<|> criarMetrica
    :<|> listarAlertas

listarUsuarios :: Handler [Usuario]
listarUsuarios = return []

criarUsuario :: Usuario -> Handler Usuario
criarUsuario u = return u

buscarUsuario :: Int -> Handler Usuario
buscarUsuario _ = throwError err404

listarMetricas :: Int -> Handler [Metrica]
listarMetricas _ = return []

criarMetrica :: Int -> Metrica -> Handler Metrica
criarMetrica _ m = return m

listarAlertas :: Int -> Handler [Alerta]
listarAlertas _ = return []

-- Configuração do CORS
corsPolicy :: Middleware
corsPolicy = cors $ const $ Just simpleCorsResourcePolicy
  { corsMethods        = map pack ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  , corsRequestHeaders = [fromString "Content-Type"]
  , corsOrigins        = Nothing
  }

-- Sobe o servidor na porta 8080
main :: IO ()
main = do
  putStrLn "Servidor rodando em http://localhost:8080"
  let settings = setPort 8080 defaultSettings
  runSettings settings $ corsPolicy $ serve saudeAPI server