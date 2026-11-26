const API_URL = 'http://localhost:3000/api/alunos';

const form = document.getElementById('aluno-form');
const tbody = document.getElementById('alunos-tbody');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

// Campos do form
const inputld = document.getElementById('aluno-id');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputCurso = document.getElementById('curso');

// Estado local
let editandoId = null;

//1. LER (GET): Buscar dados do Backend e renderizar
// na tela 
async function carregarAlunos() {
try {
    const resposta = await fetch(API_URL);
    const alunos = await resposta.json();

    tbody.innerText = '';

    if(alunos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;"> Nenhum aluno cadastrado.</td></tr>`;

    Element('tr');

    return;
    }
 
alunos.forEach(aluno => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
       <td>#${aluno.id}</td>
       <td>#${aluno.nome}</td>
       <td>#${aluno.email}</td>
       <td>#${aluno.curso}</td>
       <td> class="actions">
            <button class="btn-icon btn-edit" onclick
            "iniciarEdicao(${aluno.id},
            '${aluno.nome}')">Editar<button/>
            <button class="btn-icon btn-delete"
            onclick="deletarAluno(${aluno.id})">Excluir</button"
            </td>`;
            tbody.appendChild(tr);
      });
    } catch (erro) {
        consoçle.error('Erro ao buscar alunos:', erro);
        alert('Erro de conexão com o servidor')
    }
}
// 2.CRIAR ou ATUALIZAR (POST / PUT)
form.addEventListener('submit' , async (e) =>{
    e.preventDefault();// Evita recarregar a página
    
 const aluno = {
    nome:inputNome.value,
    email:inputEmail.value,
    curso:inputCurso.value
 };

 try {
    if(editandoId) {
        // se tem um ID, estamos editando (PUT)
        await fetch(`${API_URL}/${editandoId}`, {
           method:'PUT',
           heardrs:{'content-Type': 'aplication/json'},
           body:JSON.stringify(aluno)
            });
        }
    else {
        // Se não tem ID, estamos crinado (POST)
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(aluno)
        });
    } 

    resetarFormulario();
    carregarAlunos(); // Recarrega a lista atualizada do backend 
} catch (erro) {
    console.error('Erro ao salvar:', erro);
    alert('Erro ao salvar os dados no servidor!');
}
});
 
// 3. DELETAR (DELETE)
async function deletarAluno(id) {
   if (!confirm(`Tem certeza que deseja excluir o aluno #${id}`)) return;
   
   try {
       await fetch(`${API_URL}/${id}`, {
         method: 'DELETE'
       });
       carregarAlunos(); // Atualiza a lista após deletar
   } catch (erro) {
    console.error('Erro ao deletar:', erro);
   }
}
// Utilitários para a interface
function iniciarEdicao(id, nome, email, curso) {
    editandoId = id;
    inputld.value = id;
    inputNome.value = nome;
    inputEmail.value = email;
    inputCurso.value = curso;

    btnSave.textContent = "atualizar aluno";
    btnCancel.style.display = "block";
}
function resetarFormulario() {
    editandoId = null;
    form.reset();
    btnSave.textContent = "Salvar Aluno";
    btnCancel.style.display = "nome";
}
btnCancel.addEventListener('click' , resetarFormulario);


// Inicia buscando a lista ao carregar a página
carregarAlunos();
 