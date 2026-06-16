module Api.Regras where

import Api.Model

-- IMC
calcularIMC :: Double -> Double -> Double
calcularIMC peso alt = peso / (alt * alt)

classificarIMC :: Double -> String
classificarIMC imc
  | imc < 18.5 = "Abaixo do peso"
  | imc < 25.0 = "Peso normal"
  | imc < 30.0 = "Sobrepeso"
  | imc < 35.0 = "Obesidade grau 1"
  | imc < 40.0 = "Obesidade grau 2"
  | otherwise  = "Obesidade grau 3"

-- Pressão arterial (valor1 = sistólica, valor2 = diastólica)
classificarPressao :: Double -> Double -> String
classificarPressao sistolica diastolica
  | sistolica >= 140 || diastolica >= 90 = "Hipertensao grau 2"
  | sistolica >= 130 || diastolica >= 80 = "Hipertensao grau 1"
  | sistolica >= 120 && diastolica < 80 = "Elevada"
  | otherwise = "Normal"

-- Sono (horas)
classificarSono :: Double -> String
classificarSono horas
  | horas < 6  = "Sono insuficiente"
  | horas < 8  = "Sono adequado"
  | otherwise  = "Sono excessivo"

-- Humor (1 a 10)
classificarHumor :: Double -> String
classificarHumor humor
  | humor <= 3 = "Humor muito baixo"
  | humor <= 5 = "Humor baixo"
  | humor <= 7 = "Humor moderado"
  | otherwise  = "Humor bom"

-- Glicemia (mg/dL)
classificarGlicemia :: Double -> String
classificarGlicemia glicemia
  | glicemia < 70  = "Hipoglicemia"
  | glicemia < 100 = "Normal"
  | glicemia < 126 = "Pre-diabetes"
  | otherwise      = "Diabetes"

-- Gera alertas automaticamente com base na métrica registrada
gerarAlertas :: Metrica -> [String]
gerarAlertas m = case tipo m of
  "Peso" ->
    let imc = calcularIMC (valor1 m) 1.75  -- provisório, idealmente usa altura do usuário
        classificacao = classificarIMC imc
    in if imc < 18.5 || imc >= 25.0
       then ["IMC " ++ show (round imc :: Int) ++ " - " ++ classificacao]
       else []

  "Pressao" ->
    case valor2 m of
      Just dias ->
        let class_ = classificarPressao (valor1 m) dias
        in if class_ /= "Normal"
           then ["Pressao arterial: " ++ class_]
           else []
      Nothing -> ["Pressao: diastolica nao informada"]

  "Sono" ->
    let class_ = classificarSono (valor1 m)
    in if class_ /= "Sono adequado"
       then ["Sono: " ++ class_]
       else []

  "Humor" ->
    let class_ = classificarHumor (valor1 m)
    in if valor1 m <= 5
       then ["Humor: " ++ class_]
       else []

  "Glicemia" ->
    let class_ = classificarGlicemia (valor1 m)
    in if class_ /= "Normal"
       then ["Glicemia: " ++ class_]
       else []

  _ -> []