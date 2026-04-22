import { DatabaseModel } from "./DatabaseModel.js";
import { type ClienteDTO } from "../interface/ClienteDTO.js";

const database = new DatabaseModel().pool;

class Cliente {
  private idCliente: number = 0;
  private nome: string;
  private email: string;
  private endereco: string;
  private telefone: number;
  private cpf: number;

  constructor(
    _nome: string,
    _email: string,
    _endereco: string,
    _telefone: number,
    _cpf: number
  ) {
    this.nome = _nome;
    this.email = _email;
    this.endereco = _endereco;
    this.telefone = _telefone;
    this.cpf = _cpf;
  }

  public getIdCliente(): number {
    return this.idCliente;
  }

  public setIdCliente(_idCliente: number): void {
    this.idCliente = _idCliente;
  }

  public getNome(): string {
    return this.nome;
  }

  public setNome(_nome: string): void {
    this.nome = _nome;
  }

  public getEmail(): string {
    return this.email;
  }
  public setEmail(_email: string): void {
    this.email = _email;
  }

  public getEndereco(): string {
    return this.endereco;
  }

  public setEndereco(_endereco: string): void {
    this.endereco = _endereco;
  }

  public getTelefone(): number {
    return this.telefone;
  }

  public setTelefone(_telefone: number): void {
    this.telefone = _telefone;
  }

  public getCpf(): number {
    return this.cpf
  }

  public setCpf(_cpf: number): void {
    this.cpf = _cpf;
  }

   static async cadastrarCliente(cliente: ClienteDTO): Promise<boolean> {
    try {
      const queryInsertCliente = `INSERT INTO cliente (nome, endereco, telefone, cpf)
                                VALUES
                                ($1, $2, $3, $4)
                                RETURNING id_cliente;`;

      const respostaBD = await database.query(queryInsertCliente, [
        cliente.nome.toUpperCase(),
        cliente.endereco.toUpperCase(),
        cliente.telefone,
        cliente.cpf
      ]);
      if (respostaBD.rows.length > 0) {
        console.info(`Cliente cadastrado com sucesso. ID: ${respostaBD.rows[0].idCliente}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);
      return false;
    }
  }

  static async listarCliente(): Promise<Array<Cliente> | null> {
    try {
      let listaDeCliente: Array<Cliente> = [];
      const querySelectCliente = `SELECT * FROM cliente ORDER BY nome ASC;`;
      const respostaBD = await database.query(querySelectCliente);

      respostaBD.rows.forEach((clienteBD) => {
        const novoCliente: Cliente = new Cliente(
          clienteBD.nome.toUpperCase(),
          clienteBD.email.toUpperCase(),
          clienteBD.endereco.toUpperCase(),
          clienteBD.telefone,
          clienteBD.cpf,
        );

        novoCliente.setIdCliente(clienteBD.id_cliente);

        listaDeCliente.push(novoCliente);
      });

      return listaDeCliente;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);


      return null;
    }
  }

   static async listarClienteId(idCliente: number): Promise<Cliente | null> {
    try {
      const querySelectCliente = `SELECT * FROM cliente WHERE id_cliente=$1;`;
      const respostaBD = await database.query(querySelectCliente, [idCliente]);

        const novoCliente: Cliente = new Cliente(
          respostaBD.rows[0].nome.toUpperCase(),
          respostaBD.rows[0].email.toUpperCase(),
          respostaBD.rows[0].endereco.toUpperCase(),
          respostaBD.rows[0].telefone,
          respostaBD.rows[0].cpf
        );

        novoCliente.setIdCliente(respostaBD.rows[0].id_cliente);

      return novoCliente;
    } catch (error) {
      console.error(`Erro na consulta ao banco de dados. ${error}`);


      return null;
    }
  }
}

export default Cliente;