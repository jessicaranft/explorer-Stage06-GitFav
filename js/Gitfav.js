import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  delete(user) {
    const filteredEntries = this.entries.filter((entry) => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)
      if(userExists) {
        throw new Error('Usuário já cadastrado.')
      }
  
      const user = await GithubUser.search(username)
      if(user.login === undefined) {
        throw new Error('Usuário não encontrado.')
      }
  
      this.entries = [user, ...this.entries]
  
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  } 
}


export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      this.add(value)
    }
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    }) 
  }

  update() {
    this.nouser()
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover?')
        if(isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

      tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/jessicaranft.png" alt="Imagem de Jessica Ranft">
      <a href="https://github.com/jessicaranft" target="_blank">
        <p>Jessica Ranft</p>
        <span>/jessicaranft</span>
      </a>
    </td>
    <td class="repositories">123</td>
    <td class="followers">1234</td>
    <td>
      <button class="remove">Remover</button>
    </td>
    `
    
    return tr
  }

  nouser() {
    if (this.entries.length == 0) {
      this.root.querySelector('.no-user').classList.remove('hide')
      this.root.querySelector('.table-wrapper').classList.add('no-user-border')
    } else {
      this.root.querySelector('.no-user').classList.add('hide')
      this.root.querySelector('.table-wrapper').classList.remove('no-user-border')
    }
  }
}