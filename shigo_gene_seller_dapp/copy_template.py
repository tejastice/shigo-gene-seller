import shutil

#https://eth-converter.com/

contractAddress = "0x3eDc2579f668ba936471224388BEdba291dA94B0"

chainSelect = "Ethereum"
#chainSelect = "Goerli"
#chainSelect = "Polygon"


NFTName = "NFT Marketing Orchestra"
symbol = "NMO"
maxSupply = "9999" #not use now
weiCost = "900000000000000000"
displayCost = "0.9"


#NFTName = "Tokyo Alternative Girls"
#symbol = "TAG"
#maxSupply = "9999"
#weiCost = "120000000000000000"
#displayCost = "0.12"
marketplaceLink = "https://opensea.io/account?tab=collected"
singleMintMode = "false"

#https://eth-converter.com/

###############################################


if chainSelect == "Ethereum" :
    chainNumber = "1"
    chainName = "Ethereum"
    chainSymbol = "ETH"
    scanAddress = "https://etherscan.io/token/" + contractAddress

elif chainSelect == "Goerli" :
    chainNumber = "5"
    chainName = "Ethereum"
    chainSymbol = "ETH"
    scanAddress = "https://goerli.etherscan.io/token/" + contractAddress

elif chainSelect == "Polygon" :
    chainNumber = "137"
    chainName = "Polygon"
    chainSymbol = "MATIC"
    scanAddress = "https://polygonscan.com/token/" + contractAddress




#image copy
shutil.copy2("1x/bg.png"    , "public/config/images/bg.png")
shutil.copy2("1x/left.png"  , "public/config/images/left.png")
shutil.copy2("1x/right.png" , "public/config/images/right.png")
shutil.copy2("1x/logo.png"  , "public/config/images/logo.png")
shutil.copy2("1x/logo192.png" , "public/logo192.png")
shutil.copy2("1x/logo512.png" , "public/logo512.png")
shutil.copy2("1x/favicon.png" , "public/favicon.ico")


#abi copy
shutil.copy2("copy_template/abi.json" , "public/config/abi.json")


#config.json
with open("copy_template/config.json", encoding="utf-8") as f:
    data_lines = f.read()
    
data_lines = data_lines.replace("_CONTRACT_ADDRESS_", contractAddress)
data_lines = data_lines.replace("_SCAN_ADDRESS_", scanAddress)
data_lines = data_lines.replace("_CHAIN_NUMBER_", chainNumber)
data_lines = data_lines.replace("_CHAIN_SYMBOL_", chainSymbol)
data_lines = data_lines.replace("_CHAIN_NAME_", chainName)
data_lines = data_lines.replace("_NFT_NAME_", NFTName)
data_lines = data_lines.replace("_SYMBOL_", symbol)
data_lines = data_lines.replace("_MAX_SUPPLY_", maxSupply)
data_lines = data_lines.replace("_WEI_COST_", weiCost)
data_lines = data_lines.replace("_DISPLAY_COST_", displayCost)
data_lines = data_lines.replace("_MARKETPLACE_LINK_", marketplaceLink)
data_lines = data_lines.replace("_SINGLE_MINT_MODE_", singleMintMode)

with open("public/config/config.json", mode="w", encoding="utf-8") as f:
    f.write(data_lines)



#index.html
with open("copy_template/index.html", encoding="utf-8") as f:
    data_lines = f.read()
    
data_lines = data_lines.replace("_NFT_NAME_", NFTName)

with open("public/index.html", mode="w", encoding="utf-8") as f:
    f.write(data_lines)




#manifest.json
with open("copy_template/manifest.json", encoding="utf-8") as f:
    data_lines = f.read()
    
data_lines = data_lines.replace("_NFT_NAME_", NFTName)
data_lines = data_lines.replace("_SYMBOL_", symbol)

with open("public/manifest.json", mode="w", encoding="utf-8") as f:
    f.write(data_lines)


