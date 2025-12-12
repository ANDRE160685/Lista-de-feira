import { v4 as uuidv4 } from 'uuid';

// O Model: Define a estrutura de um item e a lógica de cálculo
class ItemFeira {
    constructor(nome = '', quantidade = 0, valorUnitario = 0) {
        const quant = parseFloat(quantidade) || 0;
        const valorUnid = parseFloat(valorUnitario) || 0;

        // Usa uuidv4() para garantir ID único
        this.id = uuidv4(); 
        this.nome = nome;                
        this.quantidade = quant;         
        this.valorUnitario = valorUnid;  

        // Campos calculados
        this.valorPorQuantidade = this.calcularValorPorQuantidade();
        this.valorTotal = this.calcularValorTotal();
    }

    calcularValorPorQuantidade() {
        return this.valorUnitario;
    }

    calcularValorTotal() {
        return parseFloat((this.quantidade * this.valorUnitario).toFixed(2)); 
    }
}

export default ItemFeira;