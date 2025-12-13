import React, { useState, useEffect } from 'react';
import { 
    View, Text, TextInput, Button, FlatList, 
    StyleSheet, Alert, Modal, TouchableOpacity, 
    ScrollView 
} from 'react-native';
import useListaController from '../controller/ListaController'; 
import * as Sharing from 'expo-sharing'; 
import * as FileSystem from 'expo-file-system/legacy'; 


// --- Componente 1: ItemCard ---
const ItemCard = ({ item, onRemover, onEditar }) => (
    <View style={styles.itemContainer}>
        <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.nome}</Text>
            <Text style={styles.itemText}>
                {item.quantidade} x R$ {item.valorUnitario.toFixed(2)} 
                = R$ {item.valorTotal.toFixed(2)}
            </Text>
        </View>
        <View style={styles.actionsContainer}>
            <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]} 
                onPress={() => onEditar(item)}
            >
                <Text style={styles.actionText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.actionButton, styles.removeButton]} 
                onPress={() => onRemover(item.id)}
            >
                <Text style={styles.actionText}>X</Text>
            </TouchableOpacity>
        </View>
    </View>
);

// --- Componente 2: EditarModal ---
const EditarModal = ({ isVisible, item, onClose, onSave }) => {
    const [nome, setNome] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [valorUnitario, setValorUnitario] = useState('');

    useEffect(() => {
        if (item) {
            setNome(item.nome);
            setQuantidade(item.quantidade.toString());
            setValorUnitario(item.valorUnitario.toString());
        }
    }, [item]);

    const handleSalvar = () => {
        if (!nome || !quantidade || !valorUnitario) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        onSave(item.id, {
            nome: nome,
            quantidade: parseFloat(quantidade.replace(',', '.')), 
            valorUnitario: parseFloat(valorUnitario.replace(',', '.')) 
        });
        onClose();
    };

    if (!item) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Editar Item</Text>
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Nome do Item"
                        value={nome}
                        onChangeText={setNome}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Quantidade"
                        keyboardType="numeric"
                        value={quantidade}
                        onChangeText={setQuantidade}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Valor Unitário (R$)"
                        keyboardType="numeric"
                        value={valorUnitario}
                        onChangeText={setValorUnitario}
                    />

                    <View style={styles.modalButtons}>
                        <Button title="Cancelar" onPress={onClose} color="#888" />
                        <Button title="Salvar Alterações" onPress={handleSalvar} color="#28a745" />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- Componente 3: RelatorioModal ---
const RelatorioModal = ({ isVisible, onClose, relatorioData }) => {
    
    const handleSaveAndShare = async () => {
        const fileName = `Relatorio_Feira_${new Date().toISOString().slice(0, 10)}.csv`;
        const fileUri = FileSystem.cacheDirectory + fileName;
        
        try {
            await FileSystem.writeAsStringAsync(fileUri, relatorioData.dados);

            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Erro", "O compartilhamento não está disponível neste dispositivo.");
                return;
            }

            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Compartilhar Relatório de Feira'
            });

            onClose();

        } catch (error) {
            console.error("Erro ao salvar/compartilhar arquivo: ", error);
            Alert.alert("Erro", "Não foi possível gerar o arquivo de relatório.");
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>📊 Relatório Final</Text>
                    
                    <View style={styles.relatorioTotal}>
                        <Text style={styles.relatorioTotalLabel}>TOTAL GERAL:</Text>
                        <Text style={styles.relatorioTotalValue}>R$ {relatorioData.total}</Text>
                    </View>

                    <Text style={styles.relatorioSubtitle}>Detalhes (Formato CSV):</Text>
                    <ScrollView style={styles.relatorioContent}>
                        <Text style={styles.relatorioText}>{relatorioData.dados}</Text>
                    </ScrollView>

                    <View style={styles.modalButtons}>
                        <Button title="Fechar" onPress={onClose} color="#888" />
                        <Button 
                            title="Salvar e Compartilhar" 
                            onPress={handleSaveAndShare} 
                            color="#17a2b8"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};


// --- Componente 4: ListaScreen (View Principal) ---
const ListaScreen = () => {
    const { 
        listaItens, adicionarItem, removerItem, calcularTotalGeral, 
        atualizarItem, isLoading, gerarRelatorioCSV 
    } = useListaController();

    const [nomeAdicao, setNomeAdicao] = useState('');
    const [quantidadeAdicao, setQuantidadeAdicao] = useState('');
    const [valorUnitarioAdicao, setValorUnitarioAdicao] = useState('');

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    const [isRelatorioModalVisible, setIsRelatorioModalVisible] = useState(false);
    const [relatorioDados, setRelatorioDados] = useState({ dados: '', total: '0.00' });


    const handleAbrirRelatorio = () => {
        if (listaItens.length === 0) {
            Alert.alert("Atenção", "Adicione itens à lista antes de gerar o relatório.");
            return;
        }
        const relatorio = gerarRelatorioCSV();
        setRelatorioDados(relatorio);
        setIsRelatorioModalVisible(true);
    };

    const handleAbrirEdicao = (item) => { setItemToEdit(item); setIsEditModalVisible(true); };
    const handleFecharEdicao = () => { setIsEditModalVisible(false); setItemToEdit(null); };
    const handleSalvarEdicao = (id, novosDados) => { atualizarItem(id, novosDados); };

    const handleAdicionar = () => {
        if (!nomeAdicao || !quantidadeAdicao || !valorUnitarioAdicao) {
            Alert.alert("Erro", "Preencha todos os campos para adicionar o item.");
            return;
        }
        adicionarItem(
            nomeAdicao, 
            quantidadeAdicao.replace(',', '.'), 
            valorUnitarioAdicao.replace(',', '.')
        );
        setNomeAdicao('');
        setQuantidadeAdicao('');
        setValorUnitarioAdicao('');
    };


    const renderFormulario = () => (
        <View style={styles.formContainer}>
            
            <View style={styles.inputRow}>
                <TextInput
                style={styles.input}
                placeholder="Nome do Item"
                value={nomeAdicao}
                onChangeText={setNomeAdicao}
                />
                <TextInput
                    style={[styles.input, styles.inputHalfQ]}
                    
                    placeholder="Quant."
                    keyboardType="numeric"
                    value={quantidadeAdicao}
                    onChangeText={setQuantidadeAdicao}
                />
                <TextInput
                    style={[styles.input, styles.inputHalfV]}
                    placeholder="Valor (R$)"
                    keyboardType="numeric"
                    value={valorUnitarioAdicao}
                    onChangeText={setValorUnitarioAdicao}
                />
            </View>
            <Button title="Adicionar Item" onPress={handleAdicionar} />
        </View>
    );


    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Carregando lista...</Text>
            </View>
        );
    }
    
    const totalGeral = calcularTotalGeral();

    const renderTotalGeral = () => (
        <View style={[styles.totalContainer, styles.totalContainerTop]}>
            <Text style={styles.totalLabel}>TOTAL GERAL:</Text>
            <Text style={styles.totalValue}>R$ {totalGeral.toFixed(2)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>🛒 Lista de Feira</Text>
            
            <View style={{ marginBottom: 10 }}>
                <Button 
                    title="Visualizar e Exportar Relatório" 
                    onPress={handleAbrirRelatorio} 
                    color="#17a2b8"
                />
            </View>

            {renderFormulario()}
            
            {renderTotalGeral()}

            <FlatList
                data={listaItens}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 60 }}
                renderItem={({ item }) => (
                    <ItemCard 
                        item={item} 
                        onRemover={removerItem}
                        onEditar={handleAbrirEdicao} 
                    />
                )}
                ListEmptyComponent={<Text style={styles.emptyList}>Lista vazia. Adicione itens!</Text>}
            />

            

            <EditarModal
                isVisible={isEditModalVisible}
                item={itemToEdit}
                onClose={handleFecharEdicao}
                onSave={handleSalvarEdicao}
            />
            
            <RelatorioModal
                isVisible={isRelatorioModalVisible}
                onClose={() => setIsRelatorioModalVisible(false)}
                relatorioData={relatorioDados}
            />
        </View>
    );
};


// --- Estilos ---
const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50, paddingHorizontal: 15, backgroundColor: '#f9f9f9' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    
    formContainer: { marginBottom: 10, padding: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
    input: { height: 40, width:160, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10, borderRadius: 5 },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
    inputHalfQ: { width: '48%', width:70 },
    inputHalfV: { width: '48%', width:100 },

    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff', borderRadius: 5, marginBottom: 5 },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600' },
    itemText: { fontSize: 14, color: '#555' },
    actionsContainer: { flexDirection: 'row', alignItems: 'center' }, 
    actionButton: { padding: 8, borderRadius: 5, marginLeft: 8 },
    editButton: { backgroundColor: '#FFC107' },
    removeButton: { backgroundColor: '#FF6347' },
    actionText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    totalContainer: { padding: 10, flexDirection: 'row', justifyContent: 'space-between', borderRadius: 8 },
    totalContainerTop: { 
        marginTop: 0, 
        marginBottom: 15, 
        borderTopWidth: 2, 
        borderTopColor: '#28a745',
        borderBottomWidth: 2,
        borderBottomColor: '#28a745',
        backgroundColor: '#e9fbe9', 
    },
    totalLabel: { fontSize: 16, fontWeight: 'bold' },
    totalValue: { fontSize: 16, fontWeight: 'bold', color: '#28a745' },
    emptyList: { textAlign: 'center', marginTop: 20, color: '#777' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 35, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 },
    
    relatorioTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 15},
    relatorioTotalLabel: { fontSize: 18, fontWeight: 'bold' },
    relatorioTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#28a745' },
    relatorioSubtitle: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
    relatorioContent: { maxHeight: 200, borderColor: '#ccc', borderWidth: 1, padding: 10, backgroundColor: '#f5f5f5' },
    relatorioText: { fontSize: 12, fontFamily: 'monospace' }
});

export default ListaScreen;