<script lang="ts">
	const projects = [
		{
			title: 'SneakyChat',
			desc: 'An experimental chat platform exploring modern web architecture.'
		},
		{
			title: 'AI Science Reels',
			desc: 'Automating generation of short AI-driven science videos for social media.'
		},
		{
			title: 'Scientific Tools',
			desc: 'Small tools and simulations for physics and scientific computing.'
		}
	];
</script>

<section class="panel projects">
	<h2>Projects</h2>
	<div class="cards">
		{#each projects as project (project.title)}
			<article class="card">
				<h3>{project.title}</h3>
				<p>{project.desc}</p>
			</article>
		{/each}
	</div>
</section>

<style>
	.panel {
		padding: 22px;
		color: var(--ui-text);
	}

	h2 {
		margin: 0 0 14px;
		font-size: 0.86rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--ui-muted);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 13px;
	}

	.card {
		padding: 15px;
		border-radius: 10px;
		border: 1px solid rgb(126 152 188 / 0.2);
		background: linear-gradient(180deg, rgb(12 19 31 / 0.78), rgb(10 16 26 / 0.72));
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.04);
		transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
	}

	.card:hover {
		transform: translateY(-2px);
		border-color: var(--glass-border-strong);
		box-shadow: 0 10px 18px rgb(0 0 0 / 0.32);
	}

	h3 {
		margin: 0 0 8px;
		font-size: 0.96rem;
		letter-spacing: 0.02em;
		color: #e0e9f6;
	}

	p {
		margin: 0;
		font-size: 0.92rem;
		line-height: 1.5;
		color: #b6c5d8;
		opacity: 0.94;
	}
</style>
