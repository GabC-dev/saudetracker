{-# LANGUAGE OverloadedStrings #-}
module DB.Database where

import Database.PostgreSQL.Simple
import Api.Model

-- Conecta ao banco de dados
conectar :: IO Connection
conectar = connect defaultConnectInfo
  { connectDatabase = "saudetracker"
  , connectUser     = "gabriel_correa"
  , connectPassword = ""
  , connectHost     = "localhost"
  }

-- USUARIOS

inserirUsuario :: Connection -> Usuario -> IO Usuario
inserirUsuario conn u = do
  [Only newId] <- query conn
    "INSERT INTO usuarios (nome, idade, altura, email) VALUES (?, ?, ?, ?) RETURNING id"
    (nome u, idade u, altura u, email u)
  return u { usuarioId = newId }

listarTodosUsuarios :: Connection -> IO [Usuario]
listarTodosUsuarios conn = do
  rows <- query_ conn "SELECT id, nome, idade, altura, email FROM usuarios"
  return $ map (\(i, n, id_, a, e) -> Usuario i n id_ a e) rows

buscarUsuarioPorId :: Connection -> Int -> IO (Maybe Usuario)
buscarUsuarioPorId conn uid = do
  rows <- query conn
    "SELECT id, nome, idade, altura, email FROM usuarios WHERE id = ?"
    (Only uid)
  case rows of
    [(i, n, id_, a, e)] -> return $ Just (Usuario i n id_ a e)
    _                   -> return Nothing

-- METRICAS

inserirMetrica :: Connection -> Metrica -> IO Metrica
inserirMetrica conn m = do
  [Only newId] <- query conn
    "INSERT INTO metricas (usuario_id, tipo, valor1, valor2) VALUES (?, ?, ?, ?) RETURNING id"
    (metricaUsuarioId m, tipo m, valor1 m, valor2 m)
  return m { metricaId = newId }

listarMetricasDoUsuario :: Connection -> Int -> IO [Metrica]
listarMetricasDoUsuario conn uid = do
  rows <- query conn
    "SELECT id, usuario_id, tipo, valor1, valor2, registrado_em FROM metricas WHERE usuario_id = ?"
    (Only uid)
  return $ map (\(i, u, t, v1, v2, r) -> Metrica i u t v1 v2 r) rows

-- ALERTAS

listarAlertasDoUsuario :: Connection -> Int -> IO [Alerta]
listarAlertasDoUsuario conn uid = do
  rows <- query conn
    "SELECT id, usuario_id, mensagem, gerado_em::timestamptz FROM alertas WHERE usuario_id = ?"
    (Only uid)
  return $ map (\(i, u, m, g) -> Alerta i u m g) rows

inserirAlerta :: Connection -> Int -> String -> IO ()
inserirAlerta conn uid msg = do
  _ <- execute conn
    "INSERT INTO alertas (usuario_id, mensagem) VALUES (?, ?)"
    (uid :: Int, msg :: String)
  return ()