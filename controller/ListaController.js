import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import ItemFeira from '../model/ItemFeira';

const STORAGE_KEY = '@FeiraApp:lista';

const ListaController = () => {
    const [listaItens, setListaItens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Efeito 1: Carregar dados ao iniciar o aplicativo (Persistência)
    useEffect(() => {
        const loadLista = async () => {
            try {
                const storedLista = await AsyncStorage.getItem(STORAGE_KEY);
                if (storedLista !== null) {
                    const parsedLista = JSON.parse(storedLista).map(itemData => 
                        new ItemFeira(itemData.nome, itemData.quantidade, itemData.valorUnitario)
                    );
                    setListaItens(parsedLista);
                }
            } catch (error) {
                console.error("Erro ao carregar a lista: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadLista();
    }, []);

    // Efeito 2: Salvar dados sempre que a lista for modificada (Persistência)
    useEffect(() => {
        if (!isLoading) { 
            const saveLista = async () => {
                try {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(listaItens));
                } catch (error) {
                    console.error("Erro ao salvar a lista: ", error);
                }
            };
            saveLista();
        }
    }, [listaItens, isLoading]);

    // 1. Adicionar Item
    const adicionarItem = (nome, quantidade, valorUnitario) => {
        const novoItem = new ItemFeira(nome, quantidade, valorUnitario);
        setListaItens(prevLista => [...prevLista, novoItem]);
    };

    // 2. Remover Item
    const removerItem = (itemId) => {
        setListaItens(prevLista => prevLista.filter(item => item.id !== itemId));
    };

    // 3. Atualizar/Editar Item
    const atualizarItem = (itemId, novosDados) => {
        setListaItens(prevLista => 
            prevLista.map(item => {
                if (item.id === itemId) {
                    const itemAtualizado = new ItemFeira(
                        novosDados.nome || item.nome,
                        novosDados.quantidade !== undefined ? novosDados.quantidade : item.quantidade,
                        novosDados.valorUnitario !== undefined ? novosDados.valorUnitario : item.valorUnitario
                    );
                    itemAtualizado.id = itemId; 
                    return itemAtualizado;
                }
                return item;
            })
        );
    };

    // 4. Calcular Total Geral
    const calcularTotalGeral = () => {
        return listaItens.reduce((total, item) => total + item.valorTotal, 0);
    };

    // 5. Gerar Relatório CSV
    const gerarRelatorioCSV = () => {
        const totalGeral = calcularTotalGeral();
        
        // Cabeçalho e formatação de números para o padrão brasileiro (vírgula)
        let csvContent = "Nome do Item;Quantidade;Valor Unitário (R$);Valor Total (R$)\n";
        
        listaItens.forEach(item => {
            const linha = [
                item.nome,
                item.quantidade.toFixed(2).replace('.', ','),
                item.valorUnitario.toFixed(2).replace('.', ','),
                item.valorTotal.toFixed(2).replace('.', ',')
            ].join(';');
            csvContent += linha + "\n";
        });
        
        csvContent += `\nTOTAL GERAL;;;R$ ${totalGeral.toFixed(2).replace('.', ',')}\n`;

        return {
            dados: csvContent,
            total: totalGeral.toFixed(2)
        };
    };

    return {
        listaItens,
        adicionarItem,
        removerItem,
        calcularTotalGeral,
        atualizarItem,
        isLoading,
        gerarRelatorioCSV
    };
};

export default ListaController;