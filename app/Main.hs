{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeOperators #-}
module Main where

import Control.Monad.IO.Class (liftIO)
import Data.String (fromString)
import Data.ByteString.Char8 (pack)
import Network.Wai.Handler.Warp (runSettings, setPort, defaultSettings)
import Network.Wai (Middleware)
import Network.Wai.Middleware.Cors
import Servant
import Server.Routes
import Api.Model
import DB.Database
import Api.Regras

-- Handlers da API
server :: Server SaudeAPI
server = listarUsuarios
    :<|> criarUsuario
    :<|> buscarUsuario
    :<|> listarMetricas
    :<|> criarMetrica
    :<|> listarAlertas

listarUsuarios :: Handler [Usuario]
listarUsuarios = do
  conn <- liftIO conectar
  liftIO $ listarTodosUsuarios conn

criarUsuario :: Usuario -> Handler Usuario
criarUsuario u = do
  conn <- liftIO conectar
  liftIO $ inserirUsuario conn u

buscarUsuario :: Int -> Handler Usuario
buscarUsuario uid = do
  conn <- liftIO conectar
  result <- liftIO $ buscarUsuarioPorId conn uid
  case result of
    Just u  -> return u
    Nothing -> throwError err404

listarMetricas :: Int -> Handler [Metrica]
listarMetricas uid = do
  conn <- liftIO conectar
  liftIO $ listarMetricasDoUsuario conn uid

criarMetrica :: Int -> Metrica -> Handler Metrica
criarMetrica _ m = do
  conn <- liftIO conectar
  metricaSalva <- liftIO $ inserirMetrica conn m
  let alertas = gerarAlertas metricaSalva
  liftIO $ putStrLn $ "Alertas gerados: " ++ show alertas
  liftIO $ mapM_ (\msg -> do
    putStrLn $ "Salvando alerta: " ++ msg
    inserirAlerta conn (metricaUsuarioId metricaSalva) msg
    putStrLn "Alerta salvo!"
    ) alertas
  return metricaSalva

listarAlertas :: Int -> Handler [Alerta]
listarAlertas uid = do
  conn <- liftIO conectar
  liftIO $ listarAlertasDoUsuario conn uid

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