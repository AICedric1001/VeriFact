 //Accuracy 
  function updateAccuracy(truePercent, falsePercent) {
    // Backwards-compatible global update (if any accuracy card exists globally)
    const globalAcc = document.querySelector('.accuracy-card .accuracy-bar');
    if (!globalAcc) return;
    const trueEl = globalAcc.querySelector('.true');
    const falseEl = globalAcc.querySelector('.false');
    const trueLabel = globalAcc.querySelector('.true-label');
    const falseLabel = globalAcc.querySelector('.false-label');
    if (trueEl) trueEl.style.width = truePercent + "%";
    if (falseEl) falseEl.style.width = falsePercent + "%";
    if (trueLabel) trueLabel.textContent = truePercent + "%";
    if (falseLabel) falseLabel.textContent = falsePercent + "%";
  }

  // Scoped accuracy updater - updates only a provided accuracy card element
  function scopedUpdateAccuracy(cardElement, truePercent, falsePercent) {
    if (!cardElement) return;
    const bar = cardElement.querySelector('.accuracy-bar');
    if (!bar) return;
    const trueEl = bar.querySelector('.true');
    const falseEl = bar.querySelector('.false');
    const truePct = bar.querySelector('.true-percent');
    const falsePct = bar.querySelector('.false-percent');
    const trueLabel = bar.querySelector('.true-label');
    const falseLabel = bar.querySelector('.false-label');
    if (trueEl) trueEl.style.width = truePercent + "%";
    if (falseEl) falseEl.style.width = falsePercent + "%";
    if (truePct) truePct.textContent = truePercent;
    if (falsePct) falsePct.textContent = falsePercent;
    if (trueLabel) trueLabel.innerHTML = `<i class="fa fa-check-circle"></i>${truePercent}%`;
    if (falseLabel) falseLabel.innerHTML = `${falsePercent}%<i class="fa fa-exclamation-triangle"></i>`;
  }