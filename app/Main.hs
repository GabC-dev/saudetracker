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
      :<|> handlerAtualizarUsuario
      :<|> handlerDeletarUsuario
      :<|> listarMetricas
      :<|> criarMetrica
      :<|> handlerAtualizarMetrica
      :<|> handlerDeletarMetrica
      :<|> listarAlertas
      :<|> handlerDeletarAlerta

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

  handlerAtualizarUsuario :: Int -> Usuario -> Handler Usuario
  handlerAtualizarUsuario uid u = do
    conn <- liftIO conectar
    liftIO $ atualizarUsuario conn uid u

  handlerDeletarUsuario :: Int -> Handler NoContent
  handlerDeletarUsuario uid = do
    conn <- liftIO conectar
    liftIO $ deletarUsuario conn uid
    return NoContent


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

  handlerAtualizarMetrica :: Int -> Metrica -> Handler Metrica
  handlerAtualizarMetrica mid m = do
    conn <- liftIO conectar
    liftIO $ atualizarMetrica conn mid m

  handlerDeletarMetrica :: Int -> Handler NoContent
  handlerDeletarMetrica mid = do
    conn <- liftIO conectar
    liftIO $ deletarMetrica conn mid
    return NoContent

  listarAlertas :: Int -> Handler [Alerta]
  listarAlertas uid = do
    conn <- liftIO conectar
    liftIO $ listarAlertasDoUsuario conn uid

  handlerDeletarAlerta :: Int -> Handler NoContent
  handlerDeletarAlerta aid = do
    conn <- liftIO conectar
    liftIO $ deletarAlerta conn aid
    return NoContent

  -- Configuração do CORS
  corsPolicy :: Middleware
  corsPolicy = cors $ const $ Just simpleCorsResourcePolicy
    { corsMethods        = map pack ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  , corsRequestHeaders = [fromString "Content-Type", fromString "Authorization"]
  , corsOrigins        = Just ([pack "https://saudetracker-front.onrender.com"], True)
  }


  -- Sobe o servidor na porta 8080
  main :: IO ()
  main = do
    putStrLn "Servidor rodando em http://localhost:8080"
    let settings = setPort 8080 defaultSettings
    runSettings settings $ corsPolicy $ serve saudeAPI server

    
  {--main :: IO ()
  main = do
    putStrLn "Servidor rodando em http://localhost:8080"

    let settings =
          setHost HostAny $
          setPort 8080 $
          defaultSettings

    let app = corsPolicy (serve saudeAPI server)

    runSettings settings app--}
    